package com.sury.controller;

import com.sury.dto.PersonaRequest;
import com.sury.dto.PersonaResponse;
import com.sury.model.Persona;
import com.sury.service.PersonaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/personas")
public class PersonaController {

    private final PersonaService service;

    public PersonaController(PersonaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<PersonaResponse> registrar(@Valid @RequestBody PersonaRequest request) {
        Persona p = service.registrar(request);
        return ResponseEntity.created(URI.create("/api/personas/" + p.getId()))
                .body(PersonaResponse.from(p));
    }

    @GetMapping("/{id}")
    public PersonaResponse obtener(@PathVariable Long id) {
        return PersonaResponse.from(service.obtener(id));
    }
}
