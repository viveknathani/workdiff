import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { queue as GetCommitsQueue } from './workers/getCommits';
import { queue as PostToSlackQueue } from './workers/postToSlack';
import session from 'express-session';
import { Express } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { ensureLoggedIn } from 'connect-ensure-login';
import config from '../config';

const localStrategy = new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
  },
  (username, password, cb) => {
    if (
      username === config.ADMIN_USERNAME &&
      password === config.ADMIN_PASSWORD
    ) {
      return cb(null, { user: 'bull-board' });
    }
    return cb(null, false);
  },
);

passport.serializeUser((user: any, cb) => {
  cb(null, user);
});

passport.deserializeUser((user: any, cb) => {
  cb(null, user);
});

passport.use(localStrategy);

const queues = [
  new BullMQAdapter(GetCommitsQueue),
  new BullMQAdapter(PostToSlackQueue),
];

const createBullDashboardAndAttachRouter = (app: Express) => {
  const adapter = new ExpressAdapter();
  adapter.setBasePath('/admin/queues');
  createBullBoard({
    queues,
    serverAdapter: adapter,
  });
  app.set('views', `${__dirname}/../web/views`);
  app.set('view engine', 'ejs');
  app.use(
    '/admin/*',
    session({
      secret: 'keyboard cat',
      cookie: {},
      saveUninitialized: true,
      resave: true,
    }),
  );
  app.use('/admin/*', passport.initialize());
  app.use('/admin/*', passport.session());
  app.get('/admin/queues/login', (req, res) => {
    res.render('login', { invalid: req.query.invalid === 'true' });
  });
  app.post(
    '/admin/queues/login',
    passport.authenticate('local', {
      failureRedirect: '/admin/queues/login?invalid=true',
      successRedirect: '/admin/queues',
    }),
  );

  app.use(
    '/admin/queues',
    ensureLoggedIn({ redirectTo: '/admin/queues/login' }),
    adapter.getRouter(),
  );
};

export { createBullDashboardAndAttachRouter };
