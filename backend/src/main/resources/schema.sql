alter table if exists bookings drop constraint if exists bookings_status_check;
update bookings
set status = case
	when status is null then 'PENDING'
	when upper(trim(status)) = 'PENDING' then 'PENDING'
	when upper(trim(status)) in ('APPROVED', 'CONFIRMED', 'ACCEPTED') then 'APPROVED'
	when upper(trim(status)) in ('CHECKED_IN', 'CHECKEDIN', 'CHECK_IN') then 'CHECKED_IN'
	when upper(trim(status)) in ('REJECTED', 'DECLINED', 'DENIED') then 'REJECTED'
	when upper(trim(status)) in ('CANCELLED', 'CANCELED', 'CANCEL') then 'CANCELLED'
	else 'PENDING'
end;
alter table if exists bookings add constraint bookings_status_check check (status in ('PENDING', 'APPROVED', 'CHECKED_IN', 'REJECTED', 'CANCELLED'));
