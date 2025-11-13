package com.example.crossword.dto.dtoCrossword;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public abstract class CrosswordDtoBase {
    private String title;
    private Integer gridWidth;
    private Integer gridHeight;
}
