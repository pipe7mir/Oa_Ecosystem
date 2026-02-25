import pytest
from datetime import date
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db as _db
from models import Member, Event, Attendance, Offering


@pytest.fixture
def app():
    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "WTF_CSRF_ENABLED": False,
            "SECRET_KEY": "test-secret",
        }
    )
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def sample_member(app):
    with app.app_context():
        m = Member(name="Juan Pérez", email="juan@test.com", status="active")
        _db.session.add(m)
        _db.session.commit()
        return m.id


@pytest.fixture
def sample_event(app):
    with app.app_context():
        e = Event(name="Culto Dominical", event_date=date(2024, 6, 2))
        _db.session.add(e)
        _db.session.commit()
        return e.id


# ── Model tests ──────────────────────────────────────────────────────────────

class TestModels:
    def test_member_creation(self, app):
        with app.app_context():
            m = Member(name="María García", email="maria@test.com", status="active")
            _db.session.add(m)
            _db.session.commit()
            assert m.id is not None
            assert Member.query.count() == 1

    def test_event_creation(self, app):
        with app.app_context():
            e = Event(name="Reunión de Jóvenes", event_date=date(2024, 7, 1))
            _db.session.add(e)
            _db.session.commit()
            assert e.id is not None

    def test_attendance_creation(self, app, sample_member, sample_event):
        with app.app_context():
            a = Attendance(member_id=sample_member, event_id=sample_event, present=True)
            _db.session.add(a)
            _db.session.commit()
            assert a.id is not None

    def test_offering_creation(self, app, sample_member):
        with app.app_context():
            o = Offering(
                member_id=sample_member,
                amount=100.0,
                offering_type="diezmo",
                offering_date=date(2024, 6, 2),
            )
            _db.session.add(o)
            _db.session.commit()
            assert o.id is not None
            assert o.amount == 100.0

    def test_member_cascade_delete(self, app, sample_member, sample_event):
        with app.app_context():
            a = Attendance(member_id=sample_member, event_id=sample_event, present=True)
            o = Offering(member_id=sample_member, amount=50.0, offering_date=date(2024, 6, 1))
            _db.session.add_all([a, o])
            _db.session.commit()
            member = Member.query.get(sample_member)
            _db.session.delete(member)
            _db.session.commit()
            assert Attendance.query.count() == 0
            assert Offering.query.filter_by(member_id=sample_member).count() == 0


# ── Route tests ───────────────────────────────────────────────────────────────

class TestDashboard:
    def test_index_200(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert "Dashboard" in resp.data.decode()


class TestMemberRoutes:
    def test_members_list_empty(self, client):
        resp = client.get("/miembros")
        assert resp.status_code == 200

    def test_member_new_get(self, client):
        resp = client.get("/miembros/nuevo")
        assert resp.status_code == 200

    def test_member_new_post(self, client):
        resp = client.post(
            "/miembros/nuevo",
            data={
                "name": "Pedro López",
                "email": "pedro@test.com",
                "phone": "555-1234",
                "status": "active",
            },
            follow_redirects=True,
        )
        assert resp.status_code == 200
        assert "Pedro López" in resp.data.decode()

    def test_member_new_missing_name(self, client):
        resp = client.post("/miembros/nuevo", data={"name": "", "status": "active"})
        assert resp.status_code == 200
        assert "obligatorio" in resp.data.decode().lower()

    def test_member_detail(self, client, sample_member):
        resp = client.get(f"/miembros/{sample_member}")
        assert resp.status_code == 200
        assert "Juan Pérez" in resp.data.decode()

    def test_member_detail_not_found(self, client):
        resp = client.get("/miembros/9999")
        assert resp.status_code == 404

    def test_member_edit_get(self, client, sample_member):
        resp = client.get(f"/miembros/{sample_member}/editar")
        assert resp.status_code == 200

    def test_member_edit_post(self, client, sample_member):
        resp = client.post(
            f"/miembros/{sample_member}/editar",
            data={"name": "Juan Editado", "status": "active"},
            follow_redirects=True,
        )
        assert resp.status_code == 200
        assert "Juan Editado" in resp.data.decode()

    def test_member_delete(self, client, sample_member):
        resp = client.post(f"/miembros/{sample_member}/eliminar", follow_redirects=True)
        assert resp.status_code == 200

    def test_member_search(self, client, sample_member):
        resp = client.get("/miembros?q=Juan")
        assert resp.status_code == 200
        assert "Juan Pérez" in resp.data.decode()

    def test_member_search_no_results(self, client, sample_member):
        resp = client.get("/miembros?q=Inexistente")
        assert resp.status_code == 200
        assert "Juan Pérez" not in resp.data.decode()


class TestEventRoutes:
    def test_events_list(self, client):
        resp = client.get("/eventos")
        assert resp.status_code == 200

    def test_event_new_get(self, client):
        resp = client.get("/eventos/nuevo")
        assert resp.status_code == 200

    def test_event_new_post(self, client):
        resp = client.post(
            "/eventos/nuevo",
            data={"name": "Culto de Navidad", "event_date": "2024-12-25", "location": "Templo Principal"},
            follow_redirects=True,
        )
        assert resp.status_code == 200
        assert "Culto de Navidad" in resp.data.decode()

    def test_event_new_missing_fields(self, client):
        resp = client.post("/eventos/nuevo", data={"name": "", "event_date": ""})
        assert resp.status_code == 200
        assert "obligatorio" in resp.data.decode().lower()

    def test_event_edit_post(self, client, sample_event):
        resp = client.post(
            f"/eventos/{sample_event}/editar",
            data={"name": "Culto Editado", "event_date": "2024-06-09"},
            follow_redirects=True,
        )
        assert resp.status_code == 200
        assert "Culto Editado" in resp.data.decode()

    def test_event_delete(self, client, sample_event):
        resp = client.post(f"/eventos/{sample_event}/eliminar", follow_redirects=True)
        assert resp.status_code == 200


class TestAttendanceRoutes:
    def test_attendance_list(self, client):
        resp = client.get("/asistencia")
        assert resp.status_code == 200

    def test_attendance_record_get(self, client, sample_event):
        resp = client.get(f"/asistencia/registrar/{sample_event}")
        assert resp.status_code == 200

    def test_attendance_record_post(self, client, sample_member, sample_event):
        resp = client.post(
            f"/asistencia/registrar/{sample_event}",
            data={"present": [str(sample_member)]},
            follow_redirects=True,
        )
        assert resp.status_code == 200

    def test_attendance_with_event_filter(self, client, sample_event):
        resp = client.get(f"/asistencia?event_id={sample_event}")
        assert resp.status_code == 200


class TestOfferingRoutes:
    def test_offerings_list(self, client):
        resp = client.get("/ofrendas")
        assert resp.status_code == 200

    def test_offering_new_get(self, client):
        resp = client.get("/ofrendas/nueva")
        assert resp.status_code == 200

    def test_offering_new_post(self, client, sample_member):
        resp = client.post(
            "/ofrendas/nueva",
            data={
                "member_id": str(sample_member),
                "amount": "250.00",
                "offering_type": "diezmo",
                "offering_date": "2024-06-02",
            },
            follow_redirects=True,
        )
        assert resp.status_code == 200
        assert "250" in resp.data.decode()

    def test_offering_new_invalid_amount(self, client):
        resp = client.post(
            "/ofrendas/nueva",
            data={"amount": "0", "offering_type": "ofrenda", "offering_date": "2024-06-02"},
        )
        assert resp.status_code == 200
        assert "monto" in resp.data.decode().lower()

    def test_offering_delete(self, client, app, sample_member):
        with app.app_context():
            o = Offering(
                member_id=sample_member,
                amount=75.0,
                offering_type="ofrenda",
                offering_date=date(2024, 6, 3),
            )
            _db.session.add(o)
            _db.session.commit()
            oid = o.id
        resp = client.post(f"/ofrendas/{oid}/eliminar", follow_redirects=True)
        assert resp.status_code == 200

    def test_offerings_date_filter(self, client, app, sample_member):
        with app.app_context():
            o = Offering(
                member_id=sample_member,
                amount=120.0,
                offering_type="ofrenda",
                offering_date=date(2024, 5, 10),
            )
            _db.session.add(o)
            _db.session.commit()
        resp = client.get("/ofrendas?date_from=2024-05-01&date_to=2024-05-31")
        assert resp.status_code == 200
        assert "120" in resp.data.decode()
