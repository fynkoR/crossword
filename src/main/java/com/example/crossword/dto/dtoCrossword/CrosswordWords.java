package com.example.crossword.dto.dtoCrossword;

import lombok.Data;

import java.util.List;

@Data
public class CrosswordWords {
    private List<CrosswordWord> words;
    private List<WordIntersection> intersections;

    @Data
    public static class CrosswordWord {
        private Long wordId;          // ID слова из базы
        private String text;             // текст слова
        private String definition;       // определение/вопрос
        private Integer startX;          // начальная координата X
        private Integer startY;          // начальная координата Y
        private String direction;        // направление: "horizontal", "vertical"
        private Integer length;          // длина слова
        private Integer number;          // номер в кроссворде
        private Boolean isSolved;        // отгадано ли слово
        private List<Integer> positions; // позиции букв в сетке [x1,y1,x2,y2,...]
    }

    @Data
    public static class WordIntersection {
        private Long word1Id;     // ID первого слова
        private Long word2Id;     // ID второго слова
        private Integer position1;   // позиция пересечения в первом слове
        private Integer position2;   // позиция пересечения во втором слове
        private String letter;       // общая буква
        private Integer x;           // координата X пересечения
        private Integer y;           // координата Y пересечения
    }
}
