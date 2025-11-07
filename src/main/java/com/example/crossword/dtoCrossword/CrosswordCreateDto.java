package com.example.crossword.dtoCrossword;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для создания нового кроссворда
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CrosswordCreateDto {
    private String title;
    private Integer dictionaryId;
    private Integer gridWidth;
    private Integer gridHeight;
    private CrosswordGrid gridData;
    private CrosswordWords wordsData;
}
