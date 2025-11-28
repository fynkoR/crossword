package com.example.crossword.dto.dtoWord;

import jakarta.validation.constraints.Size;
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
    
    @Size(min = 3, max = 15, message = "Слово должно содержать от 3 до 15 символов")
    private String word;
    
    private String definition;
}
