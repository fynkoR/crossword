package com.example.crossword.dto.dtoUser;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String login;
    private Boolean isAdmin;
}
