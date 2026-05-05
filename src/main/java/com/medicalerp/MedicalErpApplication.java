package com.medicalerp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


//@SpringBootApplication
//public class MedicalErpApplication implements CommandLineRunner {
//
//    @Autowired
//    private BCryptPasswordEncoder passwordEncoder;
//
//    public static void main(String[] args) {
//        SpringApplication.run(MedicalErpApplication.class, args);
//    }
//
//    @Override
//    public void run(String... args) throws Exception {
//        System.out.println("\n========================================================");
//        System.out.println("USE THIS EXACT HASH IN YOUR DATABASE FOR 'admin123':");
//        System.out.println(passwordEncoder.encode("admin123"));
//        System.out.println("========================================================\n");
//    }
//}
@SpringBootApplication
public class MedicalErpApplication {
    public static void main(String[] args) {
        SpringApplication.run(MedicalErpApplication.class, args);
    }
}