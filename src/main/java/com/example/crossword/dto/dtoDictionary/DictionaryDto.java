package com.example.crossword.dto.dtoDictionary;

import lombok.Data;

@Data
public class DictionaryDto {
    private Long id;
    private String title;
    private String description;
    // ❌ НЕТ words - чтобы не грузить все слова
    // ❌ НЕТ crosswords - чтобы избежать циклических ссылок
}