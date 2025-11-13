package com.example.crossword.dto.dtoWord;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для создания нового слова
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WordCreateDto {
    private String word;
    private String definition;
    private Long dictionaryId;
}
