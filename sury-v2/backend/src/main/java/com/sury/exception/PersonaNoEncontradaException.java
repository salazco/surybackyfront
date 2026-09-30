package com.sury.exception;

public class PersonaNoEncontradaException extends RuntimeException {
    public PersonaNoEncontradaException(Long id) {
        super("No se encontró la persona con id " + id + ".");
    }
}
