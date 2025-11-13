package com.example.crossword.dto.dtoCrossword;

import lombok.Data;
import java.util.List;

@Data
public class CrosswordGrid {
    private List<GridCell> cells;
    private GridSize size;

    @Data
    public static class GridCell {
        private Integer x;           // координата X в сетке
        private Integer y;           // координата Y в сетке
        private String letter;       // буква в клетке (null если пустая)
        private Boolean isBlack;     // является ли клетка черной (препятствием)
        private Integer number;      // номер слова (если клетка начальная)
        private Boolean isLocked;    // заблокирована ли клетка для редактирования
    }

    @Data
    public static class GridSize {
        private Integer width;       // ширина сетки
        private Integer height;      // высота сетки
    }
}
