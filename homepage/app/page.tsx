
import Image from 'next/image'

export default function Home() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
      <main className='w-full max-w-3xl p-8'>
        <div className='rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900'>
          <header className='mb-8'>
            <h1 className='text-4xl font-bold text-zinc-900 dark:text-white'>
              My Awesome Portfolio
            </h1>
            <p className='mt-2 text-zinc-600 dark:text-zinc-400'>
              Welcome to my corner of the internet.
            </p>
          </header>

          <section id='projects'>
            <h2 className='mb-4 text-2xl font-semibold text-zinc-900 dark:text-white'>
              Projects
            </h2>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {/* Project Card 1 */}
              <div className='rounded-lg border border-zinc-200 p-4 dark:border-zinc-800'>
                <h3 className='text-lg font-semibold text-zinc-900 dark:text-white'>
                  Project One
                </h3>
                <p className='mt-2 text-zinc-600 dark:text-zinc-400'>
                  A brief description of the first project.
                </p>
              </div>

              {/* Project Card 2 */}
              <div className='rounded-lg border border-zinc-200 p-4 dark:border-zinc-800'>
                <h3 className='text-lg font-semibold text-zinc-900 dark:text-white'>
                  Project Two
                </h3>
                <p className='mt-2 text-zinc-600 dark:text-zinc-400'>
                  A brief description of the second project.
                </p>
              </div>
            </div>
                    </section>
          
                    <section id='contact' className='mt-8'>
                      <h2 className='mb-4 text-2xl font-semibold text-zinc-900 dark:text-white'>
                        Contact Me
                      </h2>
                      <form>
                        <div className='mb-4'>
                          <label
                            htmlFor='name'
                            className='block text-zinc-600 dark:text-zinc-400'
                          >
                            Name
                          </label>
                          <input
                            type='text'
                            id='name'
                            className='w-full rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900'
                          />
                        </div>
                        <div className='mb-4'>
                          <label
                            htmlFor='email'
                            className='block text-zinc-600 dark:text-zinc-400'
                          >
                            Email
                          </label>
                          <input
                            type='email'
                            id='email'
                            className='w-full rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900'
                          />
                        </div>
                        <div className='mb-4'>
                          <label
                            htmlFor='message'
                            className='block text-zinc-600 dark:text-zinc-400'
                          >
                            Message
                          </label>
                          <textarea
                            id='message'
                            rows={4}
                            className='w-full rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900'
                          ></textarea>
                        </div>
                        <button
                          type='submit'
                          className='rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                        >
                          Send Message
                        </button>
                      </form>
                    </section>
          
                    <footer className='mt-8 text-center text-zinc-600 dark:text-zinc-400'>
                      <p>&copy; 2025 Your Name. All rights reserved.</p>
                    </footer>
                  </div>
                </main>
              </div>
            )
          }
          