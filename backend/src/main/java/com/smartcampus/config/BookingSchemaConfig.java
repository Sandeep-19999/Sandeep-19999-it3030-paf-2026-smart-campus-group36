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
                jdbcTemplate.execute("alter table bookings add constraint bookings_status_check check (status in ('PENDING', 'APPROVED', 'CHECKED_IN', 'REJECTED', 'CANCELLED'))");
            } catch (Exception ex) {
                throw ex;
            }
        };
    }
}
