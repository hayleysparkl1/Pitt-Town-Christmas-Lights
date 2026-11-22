# Pitt Town Christmas Lights Trail

A community project to help residents share their Christmas lights and help visitors plan a festive trail around Pitt Town, NSW.

## Live site

[Visit the Pitt Town Christmas Lights Trail](https://hayleysparkl1.github.io/Pitt-Town-Christmas-Lights/)

## Features

- Residents can submit a decorated home for review.
- Submissions remain pending until they are approved in Supabase.
- Visitors can browse approved homes and select stops in the order they want to visit them.
- The site creates Google Maps route links for selected homes. A single-route link is available for up to nine selections, with shorter route links as a fallback.
- Selected trails are not saved or shared by the site.

## Project status

Published prototype. Address submissions, approval, trail selection, and Google Maps links are implemented. The single-route link was tested with five stops on an iPhone with Google Maps installed.

## Built with

- HTML
- CSS
- JavaScript
- Supabase Postgres and REST API
- Google Maps URLs
- GitHub Pages

## Run locally

You’ll need Python 3 installed.

1. Clone this repository and open a terminal in the project folder.
2. Start a local web server:

   ```bash
   python3 -m http.server 8000
   ```

3. Open [http://localhost:8000](http://localhost:8000) in your browser.
4. Press `Control+C` in the terminal to stop the server when you’re done.

## Supabase configuration

The site reads its Supabase project URL and publishable key from `config.js`. The publishable key is intended for browser use; the database’s row-level security policies restrict public access to submitting pending homes and viewing approved homes.

Never put a database password or Supabase secret/service-role key in the website code or repository.