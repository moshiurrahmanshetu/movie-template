import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        movies: resolve(__dirname, 'movies/index.html'),
        latest: resolve(__dirname, 'latest/index.html'),
        popular: resolve(__dirname, 'popular/index.html'),
        categories: resolve(__dirname, 'categories/index.html'),
        categoryHub: resolve(__dirname, 'category/index.html'),
        categoryAction: resolve(__dirname, 'category/action/index.html'),
        categorySciFi: resolve(__dirname, 'category/sci-fi/index.html'),
        categoryAdventure: resolve(__dirname, 'category/adventure/index.html'),
        categoryComedy: resolve(__dirname, 'category/comedy/index.html'),
        categoryDrama: resolve(__dirname, 'category/drama/index.html'),
        categoryHorror: resolve(__dirname, 'category/horror/index.html'),
        categoryAnimation: resolve(__dirname, 'category/animation/index.html'),
        categoryThriller: resolve(__dirname, 'category/thriller/index.html'),
        categoryCrime: resolve(__dirname, 'category/crime/index.html'),
        categoryFantasy: resolve(__dirname, 'category/fantasy/index.html'),
        categoryRomance: resolve(__dirname, 'category/romance/index.html'),
        search: resolve(__dirname, 'search/index.html'),
        movieDetail: resolve(__dirname, 'movie/index.html'),
        movieDune2: resolve(__dirname, 'movie/dune-2/index.html'),
        movieInterstellar: resolve(__dirname, 'movie/interstellar/index.html'),
        movieOppenheimer: resolve(__dirname, 'movie/oppenheimer/index.html'),
        movieAvatar: resolve(__dirname, 'movie/avatar/index.html'),
        notFound: resolve(__dirname, '404.html'),
      },
    },
  },
});
