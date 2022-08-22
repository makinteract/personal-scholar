# Personal Scholar

An API wrapper that returns **citations/h-index** of a given author using the data on Google Scholar.

This API caches the result for a day.

## How to use

Create a `.env` file in the root directory with your personal _api_key_ from [SerpAPI](https://serpapi.com) (you need an account for that).

In the **.env** file:

```
api_key='xyz....'
```

Run the server

```
npm install
npm start
```

Query using the [Google Scolar](https://scholar.google.com) id. For example, given the scholar id **wVDtZB0AAAAJ**:

```
localhost:8080/author/wVDtZB0AAAAJ
```

Here is a live example

```
personal-scholar.herokuapp.com/author/wVDtZB0AAAAJ
```

It should return something like this:

```json
{
  "name": "Andrea Bianchi",
  "author_id": "wVDtZB0AAAAJ",
  "citations": 1308,
  "h_index": 20
}
```

## License

MIT
