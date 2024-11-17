# Dockerfile
FROM public.ecr.aws/lambda/python:3.12

RUN dnf install -y mesa-libGL mesa-libGLU libXext libSM libXrender && \
    dnf clean all

WORKDIR ${LAMBDA_TASK_ROOT}

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY lambda_function.py .

COPY models/best_fruit.pt models/
COPY models/best_veggie.pt models/

ENV PYTHONUNBUFFERED=1

CMD [ "lambda_function.lambda_handler" ]