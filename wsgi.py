from app import app, init_db, seed_data

init_db()
seed_data()

if __name__ == "__main__":
    app.run()
