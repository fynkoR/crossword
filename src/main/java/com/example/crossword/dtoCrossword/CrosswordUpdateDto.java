package com.example.crossword.dtoCrossword;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для обновления существующего кроссворда
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CrosswordUpdateDto {
    private String title;
    private Integer gridWidth;
    private Integer gridHeight;
    private CrosswordGrid gridData;
    private CrosswordWords wordsData;
}
