package com.medicalerp.service;

import com.medicalerp.model.User;
import com.medicalerp.repository.UserRepository;
import com.medicalerp.config.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    // Using Constructor Injection to fix the "Field injection is not recommended" warning
    public AuthService(UserRepository userRepository, JwtUtil jwtUtil, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

//    public String login(String username, String password) {
//        // Fix for "Incompatible types": use Optional
//        Optional<User> userOptional = userRepository.findByUsername(username);
//
//        // Check if user exists and password matches
//        if (userOptional.isPresent()) {
//            User user = userOptional.get();
//            if (passwordEncoder.matches(password, user.getPassword())) {
//                return jwtUtil.generateToken(user.getUsername());
//            }
//        }
//
//        return null;
//    }

    public String login(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            System.out.println("--- DEBUG INFO ---");
            System.out.println("Attempting login for: " + username);
            System.out.println("Password from frontend: [" + password + "]"); // Brackets help spot trailing spaces
            System.out.println("Hash from DB: " + user.getPassword());

            boolean matches = passwordEncoder.matches(password, user.getPassword());
            System.out.println("Do passwords match? " + matches);

            if (matches) {
                return jwtUtil.generateToken(user.getUsername());
            }
        } else {
            System.out.println("User not found in DB.");
        }

        return null;
    }
}


//package com.medicalerp.service;
//
//import com.medicalerp.model.User;
//import com.medicalerp.repository.UserRepository;
//import com.medicalerp.config.JwtUtil;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.stereotype.Service;
//
//@Service
//public class AuthService {
//    @Autowired
//    private UserRepository userRepository;
//    @Autowired
//    private JwtUtil jwtUtil;
//    @Autowired
//    private BCryptPasswordEncoder passwordEncoder;
//
//    public String login(String username, String password) {
//        User user = userRepository.findByUsername(username);
//        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
//            return jwtUtil.generateToken(user.getUsername());
//        }
//        return null;
//    }
//}
