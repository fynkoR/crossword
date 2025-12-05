package com.example.crossword.enitity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "crosswords")

public class Crossword {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private Integer grid_width;
    private Integer grid_height;
    private Integer max_hints; // максимальное количество подсказок для кроссворда
    private String crossword_type; // тип кроссворда: "AUTO" или "MANUAL"
    @OneToMany(mappedBy = "crossword", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Game> games;
    @Column(columnDefinition = "JSON")
    private String grid_data;
    @Column(columnDefinition = "JSON")
    private String words_data;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dictionary_id", nullable = false)
    private Dictionary dictionary;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy; // Пользователь, который создал кроссворд
}
