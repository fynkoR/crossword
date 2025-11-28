package com.example.crossword.controller;

import com.example.crossword.dto.dtoUser.UserDto;
import com.example.crossword.dto.dtoUser.UserRegAuthDto;
import com.example.crossword.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST контроллер для работы с пользователями
 */
@RestController
@RequestMapping("/users")
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Регистрация нового пользователя
     * POST /users/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegAuthDto userRegAuthDto) {
        try {
            logger.info("POST /users/register - Регистрация пользователя: {}", userRegAuthDto.getLogin());
            UserDto registeredUser = userService.registerUser(userRegAuthDto);
            logger.info("Пользователь успешно зарегистрирован с ID: {}", registeredUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
        } catch (RuntimeException e) {
            logger.error("Ошибка при регистрации пользователя: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Авторизация пользователя
     * POST /users/auth
     */
    @PostMapping("/auth")
    public ResponseEntity<UserDto> auth(@Valid @RequestBody UserRegAuthDto userRegAuthDto) {
        try {
            logger.info("POST /users/auth - Авторизация пользователя: {}", userRegAuthDto.getLogin());
            UserDto authenticatedUser = userService.authUser(userRegAuthDto);
            logger.info("Пользователь {} успешно авторизован", userRegAuthDto.getLogin());
            return ResponseEntity.ok(authenticatedUser);
        } catch (RuntimeException e) {
            logger.warn("Ошибка авторизации для пользователя {}: {}", userRegAuthDto.getLogin(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Получить пользователя по ID
     * GET /users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserDto(@PathVariable Long id) {
        try {
            logger.info("GET /users/{} - Получение пользователя по ID", id);
            UserDto user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            logger.warn("Пользователь с ID {} не найден", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить пользователя по логину
     * GET /users/login/{login}
     */
    @GetMapping("/login/{login}")
    public ResponseEntity<UserDto> getUserByLogin(@PathVariable String login) {
        try {
            UserDto user = userService.getUserByLogin(login);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить всех пользователей
     * GET /users
     */
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        logger.info("GET /users - Получение всех пользователей");
        List<UserDto> users = userService.getAllUsers();
        logger.info("Найдено пользователей: {}", users.size());
        return ResponseEntity.ok(users);
    }

    /**
     * Удалить пользователя
     * DELETE /users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            logger.info("DELETE /users/{} - Удаление пользователя", id);
            userService.deleteUser(id);
            logger.info("Пользователь с ID {} успешно удалён", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Ошибка при удалении пользователя ID {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Установить/снять права администратора
     * PATCH /users/{id}/admin
     */
    @PatchMapping("/{id}/admin")
    public ResponseEntity<UserDto> setAdmin(@PathVariable Long id, @RequestParam Boolean is_admin) {
        try {
            UserDto updatedUser = userService.setAdmin(id, is_admin);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
