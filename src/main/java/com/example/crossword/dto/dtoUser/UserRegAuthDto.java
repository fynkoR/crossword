package com.example.crossword.dto.dtoUser;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegAuthDto {
    
    @NotBlank(message = "Логин обязателен")
    @Size(min = 4, max = 8, message = "Логин должен содержать от 4 до 8 символов")
    private String login;
    
    @NotBlank(message = "Пароль обязателен")
    @Size(min = 4, max = 12, message = "Пароль должен содержать от 4 до 12 символов")
    private String password;
}
