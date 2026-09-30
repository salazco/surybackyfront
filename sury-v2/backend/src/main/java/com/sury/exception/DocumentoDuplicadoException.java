package com.sury.exception;

public class DocumentoDuplicadoException extends RuntimeException {
    public DocumentoDuplicadoException() {
        super("Ya existe una persona registrada con ese documento.");
    }
}
