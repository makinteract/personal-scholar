# Personal Scholar

An API wrapper that returns **citations, h-index, and papers** of a given author using data from Google Scholar.

This API caches results for a day.

## How to use

Create a `.env` file in the root directory with your personal API key from [SerpAPI](https://serpapi.com) (you need an account for that).

In the **.env** file:

```
SERPAPI_KEY='xyz....'
```

### Run with Node.js

```
npm install
npm start
```

### Run with Docker

Build and start the app using Docker Compose:

```
docker compose up -d
```

This will build the Docker image and start the service in the background. The app will be available at http://localhost:3000.

## Endpoints

Query using the [Google Scholar](https://scholar.google.com) author id. For example, given the scholar id **wVDtZB0AAAAJ**:

| Endpoint         | Description             |
| ---------------- | ----------------------- |
| `/author/:id`    | Full author information |
| `/citations/:id` | Citation count          |
| `/h-index/:id`   | H-index                 |
| `/papers/:id`    | List of papers          |
| `/all/:id`       | All data                |

### Examples

**Get author info:**

```
localhost:3000/author/wVDtZB0AAAAJ
```

**Get citations:**

```
localhost:3000/citations/wVDtZB0AAAAJ
```

Returns:

```json
{
  "source": "cache",
  "citations": {
    "all": 1308,
    "since_2021": 542
  }
}
```

**Get h-index:**

```
localhost:3000/h-index/wVDtZB0AAAAJ
```

Returns:

```json
{
  "source": "cache",
  "h_index": {
    "all": 20,
    "since_2021": 12
  }
}
```

**Get papers:**

```
localhost:3000/papers/wVDtZB0AAAAJ
```

Returns:

```json
{
  "source": "cache",
  "total": 85,
  "papers": [
    {
      "title": "Paper Title",
      "authors": "A Bianchi, B Smith",
      "publication": "Conference 2024",
      "year": "2024",
      "cited_by": 42
    }
  ]
}
```

## License

MIT
