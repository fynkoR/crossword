package com.example.crossword.dtoDictionary;

import lombok.Data;

@Data
public class DictionaryDto {
    private int id;
    private String title;
    private String description;
    // ❌ НЕТ words - чтобы не грузить все слова
    // ❌ НЕТ crosswords - чтобы избежать циклических ссылок
}