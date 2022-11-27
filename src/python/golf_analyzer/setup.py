from setuptools import setup, find_packages

VERSION = '0.0.1'

DESCRIPTION = 'Acquisition'
LONG_DESCRIPTION = 'Acquisition'

# Setting up
setup(
       # the name must match the folder name 'verysimplemodule'
        name="acquisition",
        version=VERSION,
        author="Grant Ingersoll",
        author_email="<youremail@email.com>",
        description=DESCRIPTION,
        long_description=LONG_DESCRIPTION,
        packages=find_packages(),
        install_requires=[], # add any additional packages that
        # needs to be installed along with your package. Eg: 'caer'

        keywords=['python', 'garming'],
        classifiers= [
            "Development Status :: 3 - Alpha",
            "Intended Audience :: Education",
            "Programming Language :: Python :: 3",
            "Operating System :: MacOS :: MacOS X",
            "Operating System :: Microsoft :: Windows",
        ]
)