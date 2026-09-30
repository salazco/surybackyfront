package com.sury.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record PersonaRequest(
        @NotBlank(message = "Este campo es obligatorio.")
        @Size(max = 100, message = "Máximo 100 caracteres.")
        String nombres,

        @NotBlank(message = "Este campo es obligatorio.")
        @Size(max = 100, message = "Máximo 100 caracteres.")
        String apellidos,

        @NotBlank(message = "Este campo es obligatorio.")
        @Pattern(regexp = "CC|CE|PA", message = "Tipo de documento no válido.")
        String tipoDocumento,

        @NotBlank(message = "Este campo es obligatorio.")
        @Pattern(regexp = "^[0-9A-Za-z-]{5,20}$", message = "Debe tener entre 5 y 20 caracteres.")
        String numeroDocumento,

        @NotNull(message = "Este campo es obligatorio.")
        @Past(message = "La fecha debe ser anterior a hoy.")
        LocalDate fechaNacimiento,

        @NotBlank(message = "Este campo es obligatorio.")
        @Pattern(regexp = "^[0-9+]{7,15}$", message = "Ingresa un teléfono válido.")
        String telefono,

        @Email(message = "Ingresa un correo válido.")
        @Size(max = 150, message = "Máximo 150 caracteres.")
        String email
) {}
