from distutils.core import setup

setup(
    name='geosnap',
    version='0.1',
    packages=['test', 'fbeazt', 'geosnap.service', 'geosnap', 'geosnap.views', 'geosnap.resources'],
    package_dir={'': 'src'},
    url='www.geosnap.in',
    license='Apache License 2.0',
    author='cackharot',
    author_email='cackharot@gmail.com',
    description='online food ordering app'
)
