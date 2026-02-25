from datetime import date
from extensions import db


class Member(db.Model):
    __tablename__ = "members"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=True)
    phone = db.Column(db.String(30), nullable=True)
    address = db.Column(db.String(250), nullable=True)
    birth_date = db.Column(db.Date, nullable=True)
    membership_date = db.Column(db.Date, nullable=True, default=date.today)
    status = db.Column(db.String(20), nullable=False, default="active")
    ministry = db.Column(db.String(100), nullable=True)

    attendances = db.relationship("Attendance", backref="member", lazy=True, cascade="all, delete-orphan")
    offerings = db.relationship("Offering", backref="member", lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Member {self.name}>"


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    event_date = db.Column(db.Date, nullable=False)
    event_time = db.Column(db.String(10), nullable=True)
    location = db.Column(db.String(200), nullable=True)

    attendances = db.relationship("Attendance", backref="event", lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Event {self.name}>"


class Attendance(db.Model):
    __tablename__ = "attendance"

    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey("members.id"), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    present = db.Column(db.Boolean, nullable=False, default=True)
    notes = db.Column(db.String(200), nullable=True)

    __table_args__ = (db.UniqueConstraint("member_id", "event_id", name="uq_member_event"),)

    def __repr__(self):
        return f"<Attendance member={self.member_id} event={self.event_id}>"


class Offering(db.Model):
    __tablename__ = "offerings"

    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey("members.id"), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    offering_type = db.Column(db.String(50), nullable=False, default="ofrenda")
    offering_date = db.Column(db.Date, nullable=False, default=date.today)
    notes = db.Column(db.String(200), nullable=True)

    def __repr__(self):
        return f"<Offering amount={self.amount} date={self.offering_date}>"
