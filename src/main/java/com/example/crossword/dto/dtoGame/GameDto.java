package com.example.crossword.dto.dtoGame;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class GameDto {
    private Long id;
    private Integer hintsUsed;
    private Boolean gameOver;
    private Integer solvedWordsCount;
    private Boolean isPaused;
    private Long userId;          // только ID вместо целого объекта
    private Long crosswordId;     // только ID вместо целого объекта
}
