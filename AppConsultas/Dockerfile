# Dockerfile for Flask Backend

# Use an official Python runtime as a parent image.
FROM python:3.9

# Set the working directory.
WORKDIR /app

# Copy the requirements file and install dependencies.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code.
COPY . .

# Expose port 5001 to the host.
EXPOSE 5001

# Command to run the app.
CMD ["flask", "run", "--host=0.0.0.0", "--port=5001"]
