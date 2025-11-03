package com.example.crossword.dtoUser;

import lombok.Data;

@Data
public class UserDto {
    private Integer id;
    private String login;
    private boolean isAdmin;
}
