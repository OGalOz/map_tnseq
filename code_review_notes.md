# Code Review Notes

1.) Where applicable I would use a Markdown file instead of a Text file for documentation. It can help organize things and make them a little more clear on GH

2.) I was unable to verify if the tests run because they're tied to a WS which I don't have permission to. I personally think its alright to tie the tests to existing WS objects, but I'd go ahead and make sure that others can interact with them. You can make the narrative public or just share it with people you'd expect to run the test. Personally I'd opt for the 'public' route because who knows who will run them in the future.

3.) There are a few instances where configurations get written to json files instead of bewing passed around as data objects. I couldnt quite sess out why that is. If its not necessary, it may be easier and more efficient to pass around the configuration directly.

4.) Generally, there are places where it would be easier to understand what a function is doing if returns something instead of modifying one of the inputs. There are a few places where there are good comments for that, but a couple more places could use them. Im thinking Primarily in the `FullProgram.py` file

5.) It looks like you have some level of unit tests in the files in the `util` and `full` directories, but it would be great to have those run when `kb-sdk test` is run. It would allow us to pinpoint where errors are occuring within the full run of the workflow more easily.

