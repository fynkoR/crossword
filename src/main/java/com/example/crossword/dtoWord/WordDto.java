package com.example.crossword.dtoWord;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для отображения информации о слове
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WordDto {
    private Integer id;
    private String word;
    private String definition;
    private Integer dictionaryId;
    private String dictionaryTitle; // для удобства отображения
}
