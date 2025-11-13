package com.example.crossword.dto.dtoWord;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для обновления существующего слова
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WordUpdateDto {
    private String word;
    private String definition;
}
