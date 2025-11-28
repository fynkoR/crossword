package com.example.crossword.dto.dtoWord;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
    
    @NotBlank(message = "Слово обязательно")
    @Size(min = 3, max = 15, message = "Слово должно содержать от 3 до 15 символов")
    private String word;
    
    private String definition;
    
    @NotNull(message = "ID словаря обязателен")
    private Long dictionaryId;
}
