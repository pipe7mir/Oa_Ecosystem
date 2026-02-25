import os
from datetime import date, datetime
from flask import Flask, render_template, redirect, url_for, request, flash, abort
from extensions import db
from models import Member, Event, Attendance, Offering


def create_app(config=None):
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "iglesia-secret-key-dev")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///iglesia.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    if config:
        app.config.update(config)

    db.init_app(app)

    with app.app_context():
        db.create_all()

    # ── Dashboard ──────────────────────────────────────────────────────────────
    @app.route("/")
    def index():
        total_members = Member.query.filter_by(status="active").count()
        total_events = Event.query.count()
        today = date.today()
        month_start = date(today.year, today.month, 1)
        month_attendance = (
            Attendance.query.join(Event)
            .filter(Event.event_date >= month_start, Attendance.present == True)
            .count()
        )
        total_offerings = db.session.query(db.func.sum(Offering.amount)).scalar() or 0.0
        recent_events = Event.query.order_by(Event.event_date.desc()).limit(5).all()
        return render_template(
            "index.html",
            total_members=total_members,
            total_events=total_events,
            month_attendance=month_attendance,
            total_offerings=total_offerings,
            recent_events=recent_events,
        )

    # ── Members ────────────────────────────────────────────────────────────────
    @app.route("/miembros")
    def members_list():
        q = request.args.get("q", "").strip()
        status_filter = request.args.get("status", "")
        query = Member.query
        if q:
            query = query.filter(Member.name.ilike(f"%{q}%"))
        if status_filter:
            query = query.filter(Member.status == status_filter)
        members = query.order_by(Member.name).all()
        return render_template("members/list.html", members=members, q=q, status_filter=status_filter)

    @app.route("/miembros/nuevo", methods=["GET", "POST"])
    def member_new():
        if request.method == "POST":
            name = request.form.get("name", "").strip()
            if not name:
                flash("El nombre es obligatorio.", "danger")
                return render_template("members/form.html", member=None, action="Agregar")
            birth_date = _parse_date(request.form.get("birth_date"))
            membership_date = _parse_date(request.form.get("membership_date")) or date.today()
            member = Member(
                name=name,
                email=request.form.get("email") or None,
                phone=request.form.get("phone") or None,
                address=request.form.get("address") or None,
                birth_date=birth_date,
                membership_date=membership_date,
                status=request.form.get("status", "active"),
                ministry=request.form.get("ministry") or None,
            )
            db.session.add(member)
            try:
                db.session.commit()
                flash("Miembro agregado exitosamente.", "success")
                return redirect(url_for("members_list"))
            except Exception:
                db.session.rollback()
                flash("Error: el correo ya está registrado.", "danger")
        return render_template("members/form.html", member=None, action="Agregar")

    @app.route("/miembros/<int:member_id>")
    def member_detail(member_id):
        member = Member.query.get_or_404(member_id)
        offerings = Offering.query.filter_by(member_id=member_id).order_by(Offering.offering_date.desc()).all()
        attendances = (
            Attendance.query.filter_by(member_id=member_id)
            .join(Event)
            .order_by(Event.event_date.desc())
            .all()
        )
        return render_template("members/detail.html", member=member, offerings=offerings, attendances=attendances)

    @app.route("/miembros/<int:member_id>/editar", methods=["GET", "POST"])
    def member_edit(member_id):
        member = Member.query.get_or_404(member_id)
        if request.method == "POST":
            name = request.form.get("name", "").strip()
            if not name:
                flash("El nombre es obligatorio.", "danger")
                return render_template("members/form.html", member=member, action="Editar")
            member.name = name
            member.email = request.form.get("email") or None
            member.phone = request.form.get("phone") or None
            member.address = request.form.get("address") or None
            member.birth_date = _parse_date(request.form.get("birth_date"))
            member.membership_date = _parse_date(request.form.get("membership_date")) or member.membership_date
            member.status = request.form.get("status", "active")
            member.ministry = request.form.get("ministry") or None
            try:
                db.session.commit()
                flash("Miembro actualizado exitosamente.", "success")
                return redirect(url_for("member_detail", member_id=member.id))
            except Exception:
                db.session.rollback()
                flash("Error al actualizar el miembro.", "danger")
        return render_template("members/form.html", member=member, action="Editar")

    @app.route("/miembros/<int:member_id>/eliminar", methods=["POST"])
    def member_delete(member_id):
        member = Member.query.get_or_404(member_id)
        db.session.delete(member)
        db.session.commit()
        flash("Miembro eliminado.", "success")
        return redirect(url_for("members_list"))

    # ── Events ─────────────────────────────────────────────────────────────────
    @app.route("/eventos")
    def events_list():
        events = Event.query.order_by(Event.event_date.desc()).all()
        return render_template("events/list.html", events=events)

    @app.route("/eventos/nuevo", methods=["GET", "POST"])
    def event_new():
        if request.method == "POST":
            name = request.form.get("name", "").strip()
            event_date = _parse_date(request.form.get("event_date"))
            if not name or not event_date:
                flash("El nombre y la fecha son obligatorios.", "danger")
                return render_template("events/form.html", event=None, action="Crear")
            event = Event(
                name=name,
                description=request.form.get("description") or None,
                event_date=event_date,
                event_time=request.form.get("event_time") or None,
                location=request.form.get("location") or None,
            )
            db.session.add(event)
            db.session.commit()
            flash("Evento creado exitosamente.", "success")
            return redirect(url_for("events_list"))
        return render_template("events/form.html", event=None, action="Crear")

    @app.route("/eventos/<int:event_id>/editar", methods=["GET", "POST"])
    def event_edit(event_id):
        event = Event.query.get_or_404(event_id)
        if request.method == "POST":
            name = request.form.get("name", "").strip()
            event_date = _parse_date(request.form.get("event_date"))
            if not name or not event_date:
                flash("El nombre y la fecha son obligatorios.", "danger")
                return render_template("events/form.html", event=event, action="Editar")
            event.name = name
            event.description = request.form.get("description") or None
            event.event_date = event_date
            event.event_time = request.form.get("event_time") or None
            event.location = request.form.get("location") or None
            db.session.commit()
            flash("Evento actualizado.", "success")
            return redirect(url_for("events_list"))
        return render_template("events/form.html", event=event, action="Editar")

    @app.route("/eventos/<int:event_id>/eliminar", methods=["POST"])
    def event_delete(event_id):
        event = Event.query.get_or_404(event_id)
        db.session.delete(event)
        db.session.commit()
        flash("Evento eliminado.", "success")
        return redirect(url_for("events_list"))

    # ── Attendance ─────────────────────────────────────────────────────────────
    @app.route("/asistencia")
    def attendance_list():
        events = Event.query.order_by(Event.event_date.desc()).all()
        selected_event_id = request.args.get("event_id", type=int)
        records = []
        selected_event = None
        if selected_event_id:
            selected_event = Event.query.get(selected_event_id)
            records = (
                Attendance.query.filter_by(event_id=selected_event_id)
                .join(Member)
                .order_by(Member.name)
                .all()
            )
        return render_template(
            "attendance/list.html",
            events=events,
            records=records,
            selected_event=selected_event,
            selected_event_id=selected_event_id,
        )

    @app.route("/asistencia/registrar/<int:event_id>", methods=["GET", "POST"])
    def attendance_record(event_id):
        event = Event.query.get_or_404(event_id)
        members = Member.query.filter_by(status="active").order_by(Member.name).all()
        if request.method == "POST":
            present_ids = set(map(int, request.form.getlist("present")))
            for member in members:
                existing = Attendance.query.filter_by(member_id=member.id, event_id=event_id).first()
                is_present = member.id in present_ids
                if existing:
                    existing.present = is_present
                else:
                    db.session.add(Attendance(member_id=member.id, event_id=event_id, present=is_present))
            db.session.commit()
            flash("Asistencia registrada exitosamente.", "success")
            return redirect(url_for("attendance_list", event_id=event_id))
        existing_map = {a.member_id: a.present for a in Attendance.query.filter_by(event_id=event_id).all()}
        return render_template(
            "attendance/record.html",
            event=event,
            members=members,
            existing_map=existing_map,
        )

    # ── Offerings ──────────────────────────────────────────────────────────────
    @app.route("/ofrendas")
    def offerings_list():
        date_from = request.args.get("date_from")
        date_to = request.args.get("date_to")
        query = Offering.query
        if date_from:
            query = query.filter(Offering.offering_date >= _parse_date(date_from))
        if date_to:
            query = query.filter(Offering.offering_date <= _parse_date(date_to))
        offerings = query.order_by(Offering.offering_date.desc()).all()
        total = sum(o.amount for o in offerings)
        return render_template(
            "offerings/list.html",
            offerings=offerings,
            total=total,
            date_from=date_from,
            date_to=date_to,
        )

    @app.route("/ofrendas/nueva", methods=["GET", "POST"])
    def offering_new():
        members = Member.query.filter_by(status="active").order_by(Member.name).all()
        if request.method == "POST":
            try:
                amount = float(request.form.get("amount", 0))
            except ValueError:
                amount = 0
            if amount <= 0:
                flash("El monto debe ser mayor a 0.", "danger")
                return render_template("offerings/form.html", members=members, today=date.today().isoformat())
            member_id = request.form.get("member_id") or None
            if member_id:
                member_id = int(member_id)
            offering_date = _parse_date(request.form.get("offering_date")) or date.today()
            offering = Offering(
                member_id=member_id,
                amount=amount,
                offering_type=request.form.get("offering_type", "ofrenda"),
                offering_date=offering_date,
                notes=request.form.get("notes") or None,
            )
            db.session.add(offering)
            db.session.commit()
            flash("Ofrenda registrada exitosamente.", "success")
            return redirect(url_for("offerings_list"))
        return render_template("offerings/form.html", members=members, today=date.today().isoformat())

    @app.route("/ofrendas/<int:offering_id>/eliminar", methods=["POST"])
    def offering_delete(offering_id):
        offering = Offering.query.get_or_404(offering_id)
        db.session.delete(offering)
        db.session.commit()
        flash("Ofrenda eliminada.", "success")
        return redirect(url_for("offerings_list"))

    return app


def _parse_date(value):
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
