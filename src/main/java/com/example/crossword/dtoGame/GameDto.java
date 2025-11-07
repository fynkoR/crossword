package com.example.crossword.dtoGame;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class GameDto {
    private int id;
    private int hintsUsed;
    private boolean gameOver;
    private int solvedWordsCount;
    private boolean isPaused;
    private int userId;          // только ID вместо целого объекта
    private int crosswordId;     // только ID вместо целого объекта
}
