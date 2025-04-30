# Swiss Scramble

## Development

### Setup

Use Python 3.12.x

```bash
python -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
```

### Running the dev server

```bash
fastapi run main.py
```

or with Docker

```bash
docker build . -t=swiss-backend
docker run -p 8000:8000 --env-file .env swiss-backend
```

### API Documentation

The api documentation can be found at the `/docs` endpoint

### .env file

Required values

```dotenv
SECRET_KEY=
ADMIN_USERNAME=
ADMIN_PASS=
```

### Helpful docs

[FastAPI docs](https://fastapi.tiangolo.com/)
[SQLModel docs](https://sqlmodel.tiangolo.com/)
