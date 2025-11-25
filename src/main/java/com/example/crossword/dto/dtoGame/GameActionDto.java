package com.example.crossword.dto.dtoGame;

import lombok.Data;

@Data
public class GameActionDto {
    private String action;       // "start", "check", "hint", "complete", "saveGridState"
    private Long userId;      // для старта игры ✅
    private Long crosswordId; // для старта игры ✅
    private Long wordId;      // для проверки ответа
    private String answer;       // ответ пользователя
    private Integer positionX;   // позиция (если нужно)
    private Integer positionY;
    private String gridState;    // состояние сетки: JSON массив {x, y, letter, isLocked}
}