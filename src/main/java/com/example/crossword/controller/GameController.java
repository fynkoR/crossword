package com.example.crossword.controller;

import com.example.crossword.dtoGame.GameActionDto;
import com.example.crossword.dtoGame.GameDto;
import com.example.crossword.dtoGame.GameResultDto;
import com.example.crossword.service.GameService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST контроллер для работы с играми
 */
@RestController
@RequestMapping("/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    /**
     * Начать новую игру
     * POST /games
     */
    @PostMapping
    public ResponseEntity<GameResultDto> startGame(@RequestBody GameActionDto action) {
        try {
            GameResultDto result = gameService.startGame(action);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Выполнить действие с игрой (универсальный endpoint)
     * POST /games/{id}/action
     * 
     * Поддерживаемые действия:
     * - check: проверить ответ
     * - hint: использовать подсказку
     * - complete: завершить игру
     * - pause: приостановить/возобновить игру
     * - restart: начать игру заново
     * - save: сохранить прогресс
     */
    @PostMapping("/{id}/action")
    public ResponseEntity<GameResultDto> gameAction(@PathVariable int id, @RequestBody GameActionDto action) {
        try {
            GameResultDto result = gameService.handleAction(id, action);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Получить игру по ID
     * GET /games/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<GameDto> getGame(@PathVariable int id) {
        try {
            GameDto game = gameService.getGameById(id);
            return ResponseEntity.ok(game);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить все игры пользователя
     * GET /games/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GameDto>> getUserGames(@PathVariable int userId) {
        try {
            List<GameDto> games = gameService.getGamesByUser(userId);
            return ResponseEntity.ok(games);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Удалить игру
     * DELETE /games/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable int id) {
        try {
            gameService.deleteGame(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
