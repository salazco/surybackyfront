package com.sury.service;

import com.sury.dto.PersonaRequest;
import com.sury.exception.DocumentoDuplicadoException;
import com.sury.exception.PersonaNoEncontradaException;
import com.sury.model.Persona;
import com.sury.repository.PersonaRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PersonaService {

    private final PersonaRepository repo;

    public PersonaService(PersonaRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public Persona registrar(PersonaRequest r) {
        if (repo.existsByTipoDocumentoAndNumeroDocumento(r.tipoDocumento(), r.numeroDocumento())) {
            throw new DocumentoDuplicadoException();
        }
        Persona p = new Persona();
        p.setNombres(r.nombres().trim());
        p.setApellidos(r.apellidos().trim());
        p.setTipoDocumento(r.tipoDocumento());
        p.setNumeroDocumento(r.numeroDocumento().trim());
        p.setFechaNacimiento(r.fechaNacimiento());
        p.setTelefono(r.telefono());
        p.setEmail(r.email() == null || r.email().isBlank() ? null : r.email().trim().toLowerCase());
        try {
            return repo.saveAndFlush(p);
        } catch (DataIntegrityViolationException e) {
            throw new DocumentoDuplicadoException(); // carrera entre dos registros simultáneos
        }
    }

    @Transactional(readOnly = true)
    public Persona obtener(Long id) {
        return repo.findById(id).orElseThrow(() -> new PersonaNoEncontradaException(id));
    }
}
