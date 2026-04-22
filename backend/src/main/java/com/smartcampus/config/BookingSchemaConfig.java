package com.smartcampus.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class BookingSchemaConfig {

    @Bean
    CommandLineRunner bookingSchemaMigrator(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("alter table bookings drop constraint if exists bookings_status_check");
                jdbcTemplate.execute("""
                        update bookings
                        set status = case
                            when status is null then 'PENDING'
                            when upper(trim(status)) = 'PENDING' then 'PENDING'
                            when upper(trim(status)) in ('APPROVED', 'CONFIRMED', 'ACCEPTED') then 'APPROVED'
                            when upper(trim(status)) in ('CHECKED_IN', 'CHECKEDIN', 'CHECK_IN') then 'CHECKED_IN'
                            when upper(trim(status)) in ('REJECTED', 'DECLINED', 'DENIED') then 'REJECTED'
                            when upper(trim(status)) in ('CANCELLED', 'CANCELED', 'CANCEL') then 'CANCELLED'
                            else 'PENDING'
                        end
                        """);
                jdbcTemplate.execute("alter table bookings add constraint bookings_status_check check (status in ('PENDING', 'APPROVED', 'CHECKED_IN', 'REJECTED', 'CANCELLED'))");
            } catch (Exception ex) {
                throw ex;
            }
        };
    }
}
