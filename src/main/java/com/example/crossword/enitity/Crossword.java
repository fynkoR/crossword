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
    @OneToMany(mappedBy = "crossword", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Game> games;
    @Column(columnDefinition = "JSON")
    private String grid_data;
    @Column(columnDefinition = "JSON")
    private String words_data;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dictionary_id", nullable = false)
    private Dictionary dictionary;
}
