package com.RuinMIT.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("status", "UP");
        response.put("message", "Welcome to the RuinMIT Backend API");
        response.put("documentation", "Use POST requests under /api/auth/* for authentication");
        return response;
    }
}
