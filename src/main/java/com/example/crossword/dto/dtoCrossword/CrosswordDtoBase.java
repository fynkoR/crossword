package com.example.crossword.dto.dtoCrossword;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public abstract class CrosswordDtoBase {
    
    @NotBlank(message = "Название кроссворда обязательно")
    @Size(min = 4, max = 12, message = "Название кроссворда должно содержать от 4 до 12 символов")
    private String title;
    
    private Integer gridWidth;
    private Integer gridHeight;
    private Integer maxHints; // максимальное количество подсказок
    private String crosswordType; // тип кроссворда: "AUTO" или "MANUAL"
}
