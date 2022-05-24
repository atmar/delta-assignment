import request from 'supertest';
import express from 'express';
import router from 'router';

//@ts-ignore
const app = new express();
app.use(express.json());
app.use('/', router);


test("responds to /search/log", async () => {
  const res = await request(app).post('/search/log').send({asset_id: 5, user_id: 5});
  expect(res.statusCode).toBe(201);
});

test("responds to /search/trending", async () => {
  const res = await request(app).get('/search/trending');
  expect(res.statusCode).toBe(200);
});

test("responds to /search/recent/:userid", async () => {
  const res = await request(app).get('/search/recent/1');
  expect(res.statusCode).toBe(200);
});