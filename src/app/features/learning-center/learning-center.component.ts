import { Component, signal } from '@angular/core';
import articlesData from '../../data/learning-articles.json';
import { LearningArticle } from '../../core/models/learning-article.model';
import { ModularPageComponent } from '../../layout/modular-page/modular-page.component';

@Component({
  selector: 'app-learning-center',
  standalone: true,
  imports: [ModularPageComponent],
  templateUrl: './learning-center.component.html',
  styleUrl: './learning-center.component.scss',
})
export class LearningCenterComponent {
  readonly articles = articlesData as LearningArticle[];
  readonly selectedId = signal<string | null>(null);

  readonly categories = [...new Set(this.articles.map((a) => a.category))].sort();

  select(id: string): void {
    this.selectedId.update((cur) => (cur === id ? null : id));
  }

  selectedArticle(): LearningArticle | undefined {
    const id = this.selectedId();
    return id ? this.articles.find((a) => a.id === id) : undefined;
  }

  byCategory(category: string): LearningArticle[] {
    return this.articles.filter((a) => a.category === category);
  }
}
