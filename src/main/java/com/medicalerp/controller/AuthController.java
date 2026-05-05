package com.medicalerp.controller;

import com.medicalerp.config.JwtUtil;
import com.medicalerp.model.User;
import com.medicalerp.repository.UserRepository;
import com.medicalerp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepo;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder passwordEncoder;

    // 1. Declare the AuthService variable
    private final AuthService authService;

    // 2. Inject it using the constructor (Spring Boot handles this automatically)
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        System.out.println(">>> Username received: [" + username + "]");
        System.out.println(">>> Password received: [" + password + "]");

        String token = authService.login(username, password);
        System.out.println(">>> Generated Token: " + token);

        // 2. Return the correct HTTP response based on the result
        if (token != null) {
            // Login Successful - fetch user data to return
            Optional<User> userOpt = userRepo.findByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "username", user.getUsername(),
                    "fullName", user.getFullName(),
                    "role", user.getRole()
                ));
            }
            return ResponseEntity.ok(Map.of("token", token));
        } else {
            // Login Failed
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
        }

//        Optional<User> userOpt = userRepo.findByUsername(username);
//        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                    .body(Map.of("message", "Invalid credentials"));
//        }
//        User user = userOpt.get();
//        String token = jwtUtil.generateToken(username);
//        return ResponseEntity.ok(Map.of(
//                "token", token,
//                "username", user.getUsername(),
//                "fullName", user.getFullName(),
//                "role", user.getRole()
//        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepo.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return ResponseEntity.ok(userRepo.save(user));
    }
}
