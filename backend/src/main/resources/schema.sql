alter table if exists bookings drop constraint if exists bookings_status_check;
alter table if exists bookings add constraint bookings_status_check check (status in ('PENDING', 'APPROVED', 'CHECKED_IN', 'REJECTED', 'CANCELLED'));
