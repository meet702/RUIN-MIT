package com.RuinMIT;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RuinMitApplication {

	public static void main(String[] args) {
		SpringApplication.run(RuinMitApplication.class, args);
	}

}
