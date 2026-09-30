package com.sury.dto;

import com.sury.model.Persona;
import java.time.LocalDate;

public record PersonaResponse(
        Long id,
        String nombres,
        String apellidos,
        String tipoDocumento,
        String numeroDocumento,
        LocalDate fechaNacimiento,
        String telefono,
        String email
) {
    public static PersonaResponse from(Persona p) {
        return new PersonaResponse(p.getId(), p.getNombres(), p.getApellidos(),
                p.getTipoDocumento(), p.getNumeroDocumento(), p.getFechaNacimiento(),
                p.getTelefono(), p.getEmail());
    }
}
